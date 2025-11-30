from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re
from django.utils.safestring import mark_safe

def validate_telegram_chat_id(value):
    """Валидатор для chat_id Telegram"""
    if not re.match(r'^-?\d+$', value):
        raise ValidationError('Некорректный формат chat_id. Должен содержать только цифры и знак минуса.')

class TelegramSettings(models.Model):
    """Настройки Telegram для уведомлений"""
    name = models.CharField('Название', max_length=100, help_text='Произвольное название для идентификации')
    chat_id = models.CharField(
        'Chat ID',
        max_length=50,
        unique=True,
        validators=[validate_telegram_chat_id],
        help_text='ID чата Telegram для уведомлений'
    )
    is_active = models.BooleanField('Активно', default=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.chat_id})"

    class Meta:
        verbose_name = 'Настройка Telegram'
        verbose_name_plural = 'Настройки Telegram'

class ServiceCategory(models.Model):
    """Категория услуг (например: Терапия, Ортопедия, Хирургия и т.д.)"""
    name = models.CharField('Название категории', max_length=100)
    order = models.PositiveIntegerField('Порядок отображения', default=0)

    class Meta:
        verbose_name = 'Категория услуг'
        verbose_name_plural = 'Категории услуг'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Service(models.Model):
    """Модель услуги стоматологической клиники"""
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.CASCADE,
        related_name='services',
        verbose_name='Категория'
    )
    name = models.CharField('Название услуги', max_length=200)
    description = models.TextField('Описание услуги', blank=True, null=True)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    price_from = models.BooleanField(
        'Цена «от»',
        default=False,
        help_text='Если включено — перед ценой будет написано «от»'
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ['category__order', 'name']


class Contact(models.Model):
    """Модель контактной информации клиники"""
    clinic_name = models.CharField('Название клиники', max_length=100, default='DentAll')
    address = models.TextField('Адрес')
    phone = models.CharField('Телефон', max_length=20)
    whatsapp = models.CharField('WhatsApp', max_length=20, blank=True)
    vk = models.CharField('VK', max_length=200, default="https://vk.com/dentell62")
    working_hours = models.TextField(
        'График работы',
        help_text='Вводите каждый день с новой строки. Формат: День ЧЧ:MM–ЧЧ:MM',
        default="""Понедельник 09:00–20:00
Вторник 09:00–20:00
Среда 09:00–20:00
Четверг 09:00–20:00
Пятница 09:00–20:00
Суббота 09:00–15:00
Воскресенье Выходной"""
    )
    map_embed_code = models.TextField('Код карты', blank=True)

    def __str__(self) -> str:
        return self.clinic_name

    class Meta:
        verbose_name = 'Контактная информация'
        verbose_name_plural = 'Контактная информация'

class Appointment(models.Model):
    """Модель записи на прием"""
    first_name = models.CharField('Имя', max_length=100)
    last_name = models.CharField('Фамилия', max_length=100)
    phone = models.CharField(
        'Телефон',
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^(\+7|7|8)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$',
                message="Введите номер телефона в формате: '+7(XXX)XXX-XX-XX'"
            )
        ]
    )

    comment = models.TextField('Комментарий', blank=True)
    created_at = models.DateTimeField('Дата создания', default=timezone.now)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} - {self.phone}"

    class Meta:
        verbose_name = 'Запись на прием'
        verbose_name_plural = 'Записи на прием'


class Doctor(models.Model):
    """Модель врача клиники"""
    full_name = models.CharField('ФИО врача', max_length=200)
    description = models.TextField('Описание')
    photo = models.ImageField(
        'Фотография',
        upload_to='doctors/',
        blank=True,
        null=True,
        default='images/ava.jpg'  # Путь к изображению по умолчанию
    )
    order = models.PositiveIntegerField('Порядок отображения', default=0)

    class Meta:
        verbose_name = 'Врач'
        verbose_name_plural = 'Врачи'
        ordering = ['order']

    def __str__(self):
        return self.full_name

    def photo_tag(self):
        if self.photo:
            return mark_safe(f'<img src="{self.photo.url}" width="100" />')
        return "Нет фото"
    photo_tag.short_description = 'Предпросмотр'

class License(models.Model):
    """Модель лицензии клиники"""
    title = models.CharField('Название', max_length=200, blank=True)
    image = models.ImageField('Изображение', upload_to='licenses/')
    order = models.PositiveIntegerField('Порядок отображения', default=0)

    class Meta:
        verbose_name = 'Лицензия'
        verbose_name_plural = 'Лицензии'
        ordering = ['order']

    def __str__(self):
        return self.title or f"Лицензия #{self.id}"

    def image_tag(self):
        return mark_safe(f'<img src="{self.image.url}" width="100" />')
    image_tag.short_description = 'Предпросмотр'
