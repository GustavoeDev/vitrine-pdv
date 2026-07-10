import os

_settings_module = os.environ.get('DJANGO_ENV', 'local')

if _settings_module == 'production':
    from .production import *  # noqa: F403
else:
    from .local import *  # noqa: F403
