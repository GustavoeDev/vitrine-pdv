from django.contrib.staticfiles.management.commands.runserver import (
    Command as StaticfilesRunserverCommand,
)


class Command(StaticfilesRunserverCommand):
    """Development server reachable from Expo Go on the local network."""

    default_addr = "0.0.0.0"
    default_port = "8000"
