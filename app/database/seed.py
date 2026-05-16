from app.database.models import (
    db,
    CodeSnippet
)


def seed_snippets():

    existing =CodeSnippet.query.first()

    if existing:
        return

    snippets = [

        CodeSnippet(
            title="Binary Search",
            language="Python",
            difficulty="Intermediate",
            code="""def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid

        elif arr[mid] < target:
            left = mid + 1

        else:
            right = mid - 1

    return -1"""
        ),

        CodeSnippet(
            title="Bubble Sort",
            language="Python",
            difficulty="Beginner",
            code="""def bubble_sort(arr):

    n = len(arr)

    for i in range(n):

        for j in range(0, n - i - 1):

            if arr[j] > arr[j + 1]:

                arr[j], arr[j + 1] = arr[j + 1], arr[j]

    return arr"""
        ),

        CodeSnippet(
            title="Flask API Route",
            language="Python",
            difficulty="Intermediate",
            code="""from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")

def home():

    return jsonify({
        "message": "Hello World"
    })

if __name__ == "__main__":
    app.run(debug=True)"""
        )

    ]

    db.session.add_all(snippets)

    db.session.commit()