# Kotlin Serialization

`kotlin-serialization` is serialization library for kotlin.

- https://github.com/Kotlin/kotlinx.serialization

soil-schema supports `kotlin-serialization` via `generate.kotlin.use` config.

```json config
{
  "generate": {
    "kotlin": {
      "use": ["kotlin-serialization"]
    }
  }
}
```

## soil schema

```soil schema
entity Book {
  field id: String
  field title: String

  endpoint GET /books {
    response {
      field books: List<Book>
    }
  }
}
```

## Generated Code

```kotlin generated
package com.soil

import kotlinx.serialization.*

@Serializable
data class Book(
  val id: String,
  val title: String,
) {

  data class GetBooksEndpoint {

    val method: String = "GET"
    val path: String = "/users"

    @Serializable
    data class Response(
      val books: List<Book>,
    )
  }
}
```