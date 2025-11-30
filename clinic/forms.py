from django import forms
from .models import Appointment

class AppointmentForm(forms.ModelForm):
    """Форма записи на прием"""
    class Meta:
        model = Appointment
        fields = ['first_name', 'last_name', 'phone', 'comment']
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 3}),
        }