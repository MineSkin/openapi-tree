MineSkinClient client = MineSkinClient.builder()
        .requestHandler(JsoupRequestHandler::new)
        .userAgent("MyMineSkinApp/v1.0")
        .apiKey("<TOKEN>")
        .build();
client.skins().get("<skin uuid>").thenAccept(skins->{});