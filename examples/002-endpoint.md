# Endpoint

The `entity` in soil-schema can define an `endpoint`, which means a way to access a specific REST API endpoint (HTTP method and path).

## soil schema

This schema defines `User` model with `GET /users` endpoint.

```soil schema
entity User {
  field id: Integer
  mutable field name: String

  // Simple GET Endpoint.

  endpoint GET /users {
    query sort: Enum {
      case recommended
      case newer
    }
    // [!] define success response.
    success {
      field users: List<User>
    }
  }

  // REST API CRUD

  endpoint POST /users {
    action-name create
    // [!] define request body.
    request {
      field user: User
    }
    success {
      field user: User
    }
  }

  // [!] path parameter `$id` automatic link `User.id` field.
  endpoint GET /users/$id {
    action-name fetch
    success {
      field user: User
    }
  }

  endpoint PUT /users/$id {
    action-name update
    request {
      field user: User
    }
    success {
      field user: User
    }
  }

  endpoint DELETE /users/$id {
    action-name destroy
  }

  // Custom endpoint

  endpoint POST /users/$id/follow {
    action-name follow
  }
}
```

- RequestBody uses `Draft`. see [Draft data model for request body](./003-draft.md)

## Swift

```swift generated
struct User: Decodable {

    let id: Int

    let name: String

    init(id: Int, name: String) {
        self.id = id
        self.name = name
    }

    struct Draft: Encodable {

        var name: String

        init(name: String) {
            self.name = name
        }

    }

    struct GetUsersEndpoint {

        let method: String = "GET"
        let path: String = "/users"

        typealias Request = Void

        struct Response: Decodable {

            let users: Array<User>

        }

    }

    struct CreateEndpoint {

        let method: String = "POST"
        let path: String = "/users"

        struct Request: Encodable {

            let user: User.Draft

        }

        struct Response: Decodable {

            let user: User

        }

    }

    struct FetchEndpoint {

        let method: String = "GET"
        let path: String = "/users/$id"

        typealias Request = Void

        struct Response: Decodable {

            let user: User

        }

    }

    struct UpdateEndpoint {

        let method: String = "PUT"
        let path: String = "/users/$id"

        struct Request: Encodable {

            let user: User.Draft

        }

        struct Response: Decodable {

            let user: User

        }

    }

    struct DestroyEndpoint {

        let method: String = "DELETE"
        let path: String = "/users/$id"

        typealias Request = Void

        typealias Response = Void

    }

    struct FollowEndpoint {

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

    data class Draft(
        val name: String,
    ) {

    }

    class GetUsersEndpoint {
        val method: String = "GET"
        val path: String = "/users"

        fun build(builder: UrlBuilder): UrlBuilder {
            builder.path(this.path)
            sort?.also { builder.appendQueryParameter("sort", it.rawValue) }
            return builder
        }

        var sort: Sort? = null

        enum class Sort(val rawValue: String) {
            RECOMMENDED("recommended"),
            NEWER("newer"),
        }

        data class Response(
            val users: List<User>,
        )

    }

    class CreateEndpoint(
        val request: Request,
    ) {
        val method: String = "POST"
        val path: String = "/users"

        fun build(builder: UrlBuilder): UrlBuilder {
            builder.path(this.path)
            return builder
        }

        data class Request(
            val user: User.Draft,
        )

        data class Response(
            val user: User,
        )

    }

    class FetchEndpoint(
        val id: Int,
    ) {
        val method: String = "GET"
        val path: String = "/users/$id"

        fun build(builder: UrlBuilder): UrlBuilder {
            builder.path(this.path)
            return builder
        }

        data class Response(
            val user: User,
        )

    }

    class UpdateEndpoint(
        val id: Int,
        val request: Request,
    ) {
        val method: String = "PUT"
        val path: String = "/users/$id"

        fun build(builder: UrlBuilder): UrlBuilder {
            builder.path(this.path)
            return builder
        }

        data class Request(
            val user: User.Draft,
        )

        data class Response(
            val user: User,
        )

    }

    class DestroyEndpoint(
        val id: Int,
    ) {
        val method: String = "DELETE"
        val path: String = "/users/$id"

        fun build(builder: UrlBuilder): UrlBuilder {
            builder.path(this.path)
            return builder
        }

    }

    class FollowEndpoint(
        val id: Int,
    ) {
        val method: String = "POST"
        val path: String = "/users/$id/follow"

        fun build(builder: UrlBuilder): UrlBuilder {
            builder.path(this.path)
            return builder
        }

    }

}
```
