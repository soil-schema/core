# Basic Use Case

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
package com.soil

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