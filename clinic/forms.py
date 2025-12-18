from django import forms
from django.core.exceptions import ValidationError
from .models import Appointment


class AppointmentForm(forms.ModelForm):
    privacy_policy = forms.BooleanField(
        required=True,
        error_messages={'required': 'Необходимо ваше согласие на обработку персональных данных'}
    )

    class Meta:
        model = Appointment
        fields = ['first_name', 'last_name', 'phone', 'comment']
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Например: Хочу записаться на чистку зубов'}),
        }

    def clean_privacy_policy(self):
        if not self.cleaned_data.get('privacy_policy'):
            raise ValidationError('Вы должны дать согласие на обработку персональных данных')
        return True