from flask import Flask, request, redirect, render_template, url_for
from flask_mongoengine import MongoEngine

from models import Post

app = Flask(__name__)
app.config.from_pyfile('app.cfg')
db = MongoEngine(app)

@app.route('/')
def index():
    posts = Post.objects()
    return render_template('list_posts.html', posts=posts)

# Create
@app.route('/post/add', methods=['GET', 'POST'])
def add_post():
    if request.method == 'POST':
        post = Post(
            title=str(request.form['title']), 
            content=str(request.form['content'])
            ).save()
        return redirect(url_for('index'))
    return render_template('add_post.html')

# Read
@app.route('/post/view/<post_id>')
def view_post(post_id):
    post = Post.objects(id=post_id).first()
    return render_template('view_post.html', post=post)

# Update
@app.route('/post/edit/<post_id>', methods=['GET', 'POST'])
def edit_post(post_id):
    post = Post.objects(id=post_id).first()
    if request.method == 'POST':
        post.title = str(request.form['title'])
        post.content = str(request.form['content'])
        post.save()
        return redirect(url_for('view_post', post_id=post_id))
    return render_template('edit_post.html', post=post)

# Delete
@app.route('/post/delete/<post_id>')
def del_post(post_id):
    post = Post.objects(id=post_id).first()
    post.delete()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0')