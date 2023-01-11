# Draft data model for writing

```soil schema
entity Article {
  field id: Integer
  mutable field body: String
  write-only field trackback_id: Integer?
}
```

## Swift

```swift generated
struct Article: Decodable {

    let id: Int

    let body: String

    init(id: Int, body: String) {
        self.id = id
        self.body = body
    }

    struct Draft: Encodable {

        var body: String

        var trackbackId: Int?

        init(body: String, trackbackId: Int?) {
            self.body = body
            self.trackbackId = trackbackId
        }

    }

}
```