MineSkinClient client = MineSkinClient.builder()
        .requestHandler(JsoupRequestHandler::new)
        .userAgent("MyMineSkinApp/v1.0")
        .apiKey("<api key>")
        .build();
client.skins().get("<skin uuid>").thenAccept(response -> {
    Skin skin = response.getSkin();
});