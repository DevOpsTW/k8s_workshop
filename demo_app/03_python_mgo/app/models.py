from mongoengine import *

class Post(Document):
    title = StringField(max_length=200, required=True)
    content = StringField()