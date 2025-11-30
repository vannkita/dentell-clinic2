import os
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.http import require_POST
from .models import ServiceCategory, Service, Contact, TelegramSettings, Appointment, Doctor, License
from .forms import AppointmentForm
import requests
from django.utils import timezone
import pytz
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect


SPAM_PATTERNS = re.compile(
    r'avito|авито|'
    r'яндекс\.? ?карт|yandex\.? ?maps|'
    r'доминируйте|'
    r'накрут|накручу|'
    r'seo|сео|продвижение\s+сайта?|'
    r'увеличу\s+(посещаемость|доход|трафик)|'
    r'бесплатный\s+аудит|free\s+seo|'
    r'внутренняя\s+оптимизация|'
    r'работа\s+по\s+договору|'
    r'опыт.{0,20}более.{0,20}(20|двадцати)|'
    r'удален?ие\s+плохих?\s+отзывов?|'
    r'созда[нд]им\s+отзывы|напишу\s+отзывы|'
    r'контекстн.{0,10}реклам|таргет|'
    r'здравствуйте.*специалист.{0,50}лет|'
    r'кратко\s+о\s+себе|'
    r'основные\s+направления\s+моей\s+деятельности',
    re.IGNORECASE
)


def home(request):
    """Главная страница сайта"""
    categories = ServiceCategory.objects.prefetch_related('services').order_by('order')
    contact = Contact.objects.first()
    doctors = Doctor.objects.all().order_by('order')
    licenses = License.objects.all().order_by('order')
    
    context = {
        'categories': categories,
        'contact': contact,
        'doctors': doctors,
        'licenses': licenses,
    }
    return render(request, 'home.html', context)


def has_cyrillic(text: str) -> bool:
    """Есть ли хотя бы одна кириллическая буква"""
    return bool(re.search(r'[а-яё]', text, re.IGNORECASE))


def is_spam(data: dict) -> bool:
    """Возвращает True — если это спам"""
    first_name = (data.get('first_name') or '').strip()
    last_name  = (data.get('last_name') or '').strip()
    comment    = (data.get('comment') or '').strip()
    phone      = (data.get('phone') or '').strip()

    name_text = first_name + last_name
    if len(re.findall(r'[а-яё]', name_text, re.IGNORECASE)) < 4:
        return True

    if comment and not has_cyrillic(comment):
        return True

    full_text = f"{first_name} {last_name} {comment} {phone}".lower()
    if SPAM_PATTERNS.search(full_text):
        return True

    return False


@csrf_protect
@require_POST
def create_appointment(request):
    if is_spam(request.POST):
        return JsonResponse({
            'success': True,
            'redirect_url': '/'
        })

    form = AppointmentForm(request.POST)

    if form.is_valid():
        appointment = form.save()
        send_telegram_notification(appointment)

        return JsonResponse({
            'success': True,
            'redirect_url': '/'
        })

    # Обычные ошибки формы
    errors = {field: [str(e) for e in err_list] for field, err_list in form.errors.items()}
    return JsonResponse({
        'success': False,
        'error': 'Пожалуйста, исправьте ошибки в форме',
        'errors': errors
    }, status=400)


def send_telegram_notification(appointment) -> bool:
    """Отправка уведомлений во все активные чаты Telegram"""
    active_settings = TelegramSettings.objects.filter(is_active=True)
    if not active_settings:
        return False
    
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return False
    
    # Конвертируем время в московское
    moscow_tz = pytz.timezone('Europe/Moscow')
    moscow_time = appointment.created_at.astimezone(moscow_tz)
    
    # Форматируем телефон в международный формат
    phone = appointment.phone
    cleaned_phone = re.sub(r'\D', '', phone)  # Удаляем все нецифровые символы
    
    # Преобразуем в формат +7XXXXXXXXXX
    if cleaned_phone.startswith('8'):
        formatted_phone = '+7' + cleaned_phone[1:]
    elif cleaned_phone.startswith('7'):
        formatted_phone = '+' + cleaned_phone
    elif len(cleaned_phone) == 10:
        formatted_phone = '+7' + cleaned_phone
    else:
        formatted_phone = '+7' + cleaned_phone[-10:]  # Берем последние 10 цифр
    
    # Убедимся, что номер имеет правильную длину
    if len(formatted_phone) != 12:
        formatted_phone = phone  # Возвращаем оригинал, если что-то пошло не так
    
    message = (
        "Новая запись на прием!\n\n"
        f"👤 Имя: {appointment.first_name} {appointment.last_name}\n"
        f"📱 Телефон: {formatted_phone}\n"
        f"💬 Комментарий: {appointment.comment or 'нет комментария'}\n"
        f"🕒 Дата создания: {moscow_time.strftime('%d.%m.%Y %H:%M')}"
    )
    
    results = []
    for setting in active_settings:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': setting.chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        try:
            response = requests.post(url, json=payload)
            results.append(response.status_code == 200)
        except Exception as e:
            results.append(False)
    
    return any(results)
