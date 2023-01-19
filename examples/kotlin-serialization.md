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
    success {
      field books: List<Book>
    }
  }
}
```

## Generated Code

```kotlin generated
package com.soil

import android.net.Uri.Builder as UrlBuilder
import kotlinx.serialization.*

@Serializable
data class Book(
    val id: String,
    val title: String,
) {

    class GetBooksEndpoint(
        val format: StringFormat,
    ) {
        val method: String = "GET"
        val path: String = "/books"

        fun build(builder: UrlBuilder): UrlBuilder = builder.path(this.path)

        @Serializable
        data class Response(
            val books: List<Book>,
        )

        @OptIn(ExperimentalSerializationApi::class)
        fun encode(): String = ""

        @OptIn(ExperimentalSerializationApi::class)
        fun decode(body: String): Response = format.decodeFromString(body)
    }

}
```