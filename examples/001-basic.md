# Basic Use Case

## config

```json config
{
  "kotlin": {
    "package": "com.soil-schema.examples",
    "use": "kotlin-serialization"
  }
}
```

## soil schema

```soil schema
entity Account {
  field id: Integer
  field name: String
}
```

## Swift

```swift generated
struct Account: Codable {

    let id: Int

    let name: String

    init(id: Int, name: String) {
        self.id = id
        self.name = name
    }
}
```

## Kotlin

```kotlin generated
package com.soil-schema.examples

import kotlinx.serialization.*

@Serializable
data class Account(
    val id: Int
    val name: String
)
```

## mock

```json mock
{
  "id": 0,
  "name": "string"
}
```