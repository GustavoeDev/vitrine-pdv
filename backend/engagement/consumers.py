import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer


def user_notification_group_name(user_id) -> str:
    return f'notifications_{user_id}'


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')

        if user is None or not user.is_authenticated:
            await self.close()
            return

        self.group_name = user_notification_group_name(user.id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_created(self, event):
        await self.send(text_data=json.dumps(event['payload']))
