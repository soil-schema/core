# Endpoint

The `entity` in soil-schema can define an `endpoint`, which means a way to access a specific REST API endpoint (HTTP method and path).

## soil schema

This schema defines `User` model with `GET /users` endpoint.

```soil schema
entity User {
  field id: Integer
  field name: String

  endpoint GET /users {
    response {
      field users: List<User>
    }
  }
}
```

## Swift

```swift generated
struct User: Codable {

    let id: Int

    let name: String

    init(id: Int, name: String) {
        self.id = id
        self.name = name
    }

    struct GetUsersEndpoint {

        let method: String = "GET"
        let path: String = "/users"

        typealias Request = Void

        struct Response: Decodable {

            let users: [User]

        }
    }
}
```

## Kotlin

```kotlin generated
package com.soil

data class User(
  val id: Int,
  val name: String,
) {

  data class GetUsersEndpoint {

    val method: String = "GET"
    val path: String = "/users"

    data class Response(
      val users: List<User>,
    )
  }
}
```
