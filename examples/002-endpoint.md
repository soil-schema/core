# Endpoint

The `entity` in soil-schema can define an `endpoint`, which means a way to access a specific REST API endpoint (HTTP method and path).

## soil schema

This schema defines `User` model with `GET /users` endpoint.

```soil schema
entity User {
  field id: Integer
  field name: String

  endpoint GET /users {
    query sort: Enum {
      values recommended, newer
    }
    success {
      field users: List<User>
    }
  }

  endpoint POST /users/$id/follow {
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

            let users: Array<User>

        }

    }

    struct PostUsersIdFollowEndpoint {

        let method: String = "POST"
        let path: String = "/users/$id/follow"

        typealias Request = Void

        typealias Response = Void

    }

}
```

## Kotlin

```kotlin generated
package com.soil

import android.net.Uri.Builder as UrlBuilder

data class User(
    val id: Int,
    val name: String,
) {

    class GetUsersEndpoint {
        val method: String = "GET"
        val path: String = "/users"

        fun build(builder: UrlBuilder): UrlBuilder = builder.path(this.path)

        data class Response(
            val users: List<User>,
        )

    }

    class PostUsersIdFollowEndpoint(
        val id: Int,
    ) {
        val method: String = "POST"
        val path: String = "/users/$id/follow"

        fun build(builder: UrlBuilder): UrlBuilder = builder.path(this.path)

    }

}
```
