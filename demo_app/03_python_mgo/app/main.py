from flask import Flask, request, redirect, render_template, url_for
from flask_mongoengine import MongoEngine

from datetime import datetime

from models import Post

import os

app = Flask(__name__)
app.config.from_pyfile('app.cfg')
app.config.from_pyfile('build-date.txt')
db = MongoEngine(app)

class BlogConfig():
    def __init__(self, title, banner_title, banner_subtitle):
        self.title = title
        self.banner_title = banner_title
        self.banner_subtitle = banner_subtitle

blog_config = BlogConfig(
    app.config['BLOG_TITLE'], 
    app.config['BLOG_BANNER_TITLE'], 
    app.config['BLOG_BANNER_SUBTITLE'])

hostname = os.getenv('HOSTNAME', default='')
version = app.config['VERSION']

@app.route('/')
def index():
    posts = Post.objects().order_by('-update_at')
    return render_template(
        'list_posts.html', 
        hostname=hostname,
        version=version,
        blog_config=blog_config, 
        posts=posts)

# Create
@app.route('/post/add', methods=['GET', 'POST'])
def add_post():
    if request.method == 'POST':
        post = Post(
            title=str(request.form['title']), 
            content=str(request.form['content']),
            update_at=datetime.now()
            ).save()
        return redirect(url_for('index'))
    return render_template(
        'add_post.html',
        hostname=hostname,
        version=version,
        blog_config=blog_config)

# Read
@app.route('/post/view/<post_id>')
def view_post(post_id):
    post = Post.objects(id=post_id).first()
    return render_template(
        'view_post.html',
        hostname=hostname,
        version=version,
        blog_config=blog_config,
        post=post)

# Update
@app.route('/post/edit/<post_id>', methods=['GET', 'POST'])
def edit_post(post_id):
    post = Post.objects(id=post_id).first()
    if request.method == 'POST':
        post.title = str(request.form['title'])
        post.content = str(request.form['content'])
        post.update_at = datetime.now()
        post.save()
        return redirect(url_for('view_post', post_id=post_id))
    return render_template(
        'edit_post.html',
        hostname=hostname,
        version=version,
        blog_config=blog_config,
        post=post)

# Delete
@app.route('/post/delete/<post_id>')
def del_post(post_id):
    post = Post.objects(id=post_id).first()
    post.delete()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0')