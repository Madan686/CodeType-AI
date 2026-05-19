from app.database.models import (
    db,
    Snippet
)


def seed_snippets():

    existing_snippet = Snippet.query.first()

    if existing_snippet:

        return

    snippets = [

        Snippet(
            language="python",
            difficulty="easy",
            topic="functions",
            code="""def greet(name):
    return f"Hello {name}"
"""
        ),

        Snippet(
            language="python",
            difficulty="medium",
            topic="loops",
            code="""for i in range(5):
    print(i)
"""
        ),

        Snippet(
            language="java",
            difficulty="easy",
            topic="classes",
            code="""public class Main {

    public static void main(String[] args) {

        System.out.println("Hello");

    }

}
"""
        ),

        Snippet(
            language="javascript",
            difficulty="easy",
            topic="functions",
            code="""function greet(name) {

    return `Hello ${name}`;

}
"""
        )

    ]

    db.session.add_all(snippets)

    db.session.commit()

    print("Snippets Seeded Successfully")