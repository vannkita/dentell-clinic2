import re
import phonenumbers
from django.core.exceptions import ValidationError


def validate_phone(value):
    """Проверка корректности номера телефона"""
    try:
        phone = phonenumbers.parse(value, None)
        if not phonenumbers.is_valid_number(phone):
            raise ValidationError('Некорректный номер телефона.')
    except phonenumbers.NumberParseException:
        raise ValidationError(
            'Введите номер в международном формате, например +79001234567.'
        )


def validate_telegram_chat_id(value):
    """Проверка корректности chat_id для Telegram"""
    if not re.match(r'^-?\d+$', value):
        raise ValidationError(
            'Некорректный chat_id. Используйте только цифры и "-" при '
            'необходимости.'
        )
