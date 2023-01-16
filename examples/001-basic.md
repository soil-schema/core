# Basic Use Case

The basic use case for soil-schema is to generate code for a data model.

## soil schema

This schema defines `Account` model with integer id and string name.

```soil schema
entity Account {
  field id: Integer
  field name: String
}
```

## Swift

The Swift generated code includes a initializer.

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

In this example, the Kotlin generated code contains an empty body.
In most cases, the class body contains additional data model definitions.

```kotlin generated
package com.soil

import android.net.Uri.Builder as UrlBuilder

data class Account(
    val id: Int,
    val name: String,
) {

}
```

## mock

```json mock
{
  "id": 0,
  "name": "string"
}
```