"""OpenAPI / Swagger configuration helpers."""

SPECTACULAR_SETTINGS = {
    'TITLE': 'VitrinePDV API',
    'DESCRIPTION': """
    API REST da plataforma VitrinePDV - Uma vitrine digital para comércios locais,
    com descoberta de lojas, promoções, favoritos, avaliações e notificações em tempo real.
    """,
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'TAGS': [
        {'name': 'Sistema', 'description': 'Health check e utilitários.'},
        {'name': 'Autenticação', 'description': 'Registro, login e refresh de tokens.'},
        {'name': 'Usuários', 'description': 'Perfil e preferências do usuário autenticado.'},
        {'name': 'Lojas', 'description': 'Cadastro, descoberta e gestão de estabelecimentos.'},
        {'name': 'Catálogo', 'description': 'Produtos públicos e gestão pelo lojista.'},
        {'name': 'Marketing', 'description': 'Promoções e destaques.'},
        {'name': 'Engajamento', 'description': 'Favoritos, avaliações e notificações.'},
        {'name': 'Administração', 'description': 'Moderação de lojas (staff).'},
    ],
    'POSTPROCESSING_HOOKS': ['core.openapi.tag_operations_by_path'],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayRequestDuration': True,
        'filter': True,
    },
}

_PATH_TAG_RULES: tuple[tuple[str, str], ...] = (
    ('/health/', 'Sistema'),
    ('/media/', 'Sistema'),
    ('/auth/', 'Autenticação'),
    ('/users/', 'Usuários'),
    ('/admin/', 'Administração'),
    ('/merchant/', 'Lojas'),
    ('/categories/', 'Lojas'),
    ('/stores/', 'Lojas'),
    ('/geocode/', 'Lojas'),
    ('/search/', 'Lojas'),
    ('/products/', 'Catálogo'),
    ('/promotions/', 'Marketing'),
    ('/favorites/', 'Engajamento'),
    ('/notifications/', 'Engajamento'),
    ('/reviews/', 'Engajamento'),
)


def tag_operations_by_path(result, generator, request, public):
    for path, path_item in result.get('paths', {}).items():
        for operation in path_item.values():
            if not isinstance(operation, dict):
                continue

            for prefix, tag in _PATH_TAG_RULES:
                if prefix in path:
                    operation['tags'] = [tag]
                    break

    return result
