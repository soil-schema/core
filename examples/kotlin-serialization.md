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
}
```