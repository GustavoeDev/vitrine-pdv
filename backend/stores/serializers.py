from rest_framework import serializers

from stores.models import Category


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "parent_id", "name", "photo_url", "children")

    def get_children(self, category: Category) -> list[dict]:
        if not self.context.get("include_children", True):
            return []

        children = category.children.all()
        serializer = CategorySerializer(
            children,
            many=True,
            context={"include_children": False},
        )
        return serializer.data


class CategoryDetailSerializer(CategorySerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True, allow_null=True)

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ("parent_name",)
