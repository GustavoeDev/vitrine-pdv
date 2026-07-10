from .base import *  # noqa: F403

DEBUG = False

SECRET_KEY = env('SECRET_KEY')  # noqa: F405

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')  # noqa: F405

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])  # noqa: F405

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True

USE_S3 = env.bool('USE_S3', default=True)  # noqa: F405

if USE_S3:
    INSTALLED_APPS += ['storages']  # noqa: F405

    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')  # noqa: F405
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='sa-east-1')  # noqa: F405
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default='')  # noqa: F405
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }

    STORAGES = {  # noqa: F405
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }
