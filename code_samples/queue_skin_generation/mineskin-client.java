MineSkinClient client = MineSkinClient.builder()
        .requestHandler(JsoupRequestHandler::new)
        .userAgent("MyMineSkinApp/v1.0")
        .apiKey("<api key>")
        .build();
GenerateRequest request = GenerateRequest.upload(file)
        .name("My Skin")
        .visibility(Visibility.PUBLIC);
client.queue().submit(request).thenAccept(response -> {
    JobInfo job = response.getJob();
});