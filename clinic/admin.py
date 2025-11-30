from django.contrib import admin
from .models import Service, Contact, Appointment, TelegramSettings, Doctor, License, ServiceCategory


class ServiceInLine(admin.TabularInline):
    model = Service
    extra = 1
    fields = ('name', 'price', 'description')


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'services_count')
    list_editable = ('order',)
    ordering = ('order', 'name')
    inlines = [ServiceInLine]

    def services_count(self, obj):
        return obj.services.count()
    services_count.short_description = 'Кол-во услуг'



@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'price_from')
    list_editable = ('price', 'price_from')
    list_filter = ('category', 'price_from')
    search_fields = ('name', 'description')
    list_select_related = ('category',)

    fieldsets = (
        ('Основная информация', {
            'fields': ('category', 'name', 'description')
        }),
        ('Ценообразование', {
            'fields': ('price', 'price_from'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """Административный интерфейс для контактной информации"""
    def has_add_permission(self, request) -> bool:
        """Разрешаем добавить только одну запись"""
        return not Contact.objects.exists()
    
    def has_delete_permission(self, request, obj=None) -> bool:
        """Запрещаем удаление контактной информации"""
        return False
    
    list_display = ('clinic_name', 'phone', 'working_hours_short')
    fieldsets = (
        ('Основная информация', {
            'fields': ('clinic_name', 'address')
        }),
        ('Контактные данные', {
            'fields': ('phone', 'whatsapp')
        }),
        ('Расписание', {
            'fields': ('working_hours',)
        }),
        ('Интеграция с картами', {
            'fields': ('map_embed_code',),
            'classes': ('wide',)
        }),
    )
    
    def working_hours_short(self, obj) -> str:
        """Сокращенное отображение часов работы"""
        if len(obj.working_hours) > 30:
            return f'{obj.working_hours[:30]}...'
        return obj.working_hours
    working_hours_short.short_description = 'Часы работы'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Административный интерфейс для записей на прием"""
    list_display = ('first_name', 'last_name', 'phone', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name', 'phone')
    readonly_fields = ('created_at',)

@admin.register(TelegramSettings)
class TelegramSettingsAdmin(admin.ModelAdmin):
    """Административный интерфейс для настроек Telegram"""
    list_display = ('name', 'chat_id', 'is_active', 'created_at')
    list_editable = ('is_active',)
    search_fields = ('name', 'chat_id')
    ordering = ('-created_at',)
    fields = ('name', 'chat_id', 'is_active')
    readonly_fields = ('created_at',)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'order', 'photo_tag')
    list_editable = ('order',)

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'image_tag')
    list_editable = ('order',)
