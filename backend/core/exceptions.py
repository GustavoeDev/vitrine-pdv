from typing import Any

from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(
    exc: Exception,
    context: dict[str, Any],
) -> Response | None:
    """Central hook for consistent API error formatting (extend as needed)."""
    return exception_handler(exc, context)
