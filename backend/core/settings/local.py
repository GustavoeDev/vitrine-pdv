from .base import *  # noqa: F403

DEBUG = env.bool('DEBUG', default=True)  # noqa: F405

SECRET_KEY = env(  # noqa: F405
    'SECRET_KEY',
    default='django-insecure-dev-only-change-in-production',
)

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True

ENABLE_API_DOCS = env.bool('ENABLE_API_DOCS', default=True)  # noqa: F405
