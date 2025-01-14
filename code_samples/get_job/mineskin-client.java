MineSkinClient client = MineSkinClient.builder()
        .requestHandler(JsoupRequestHandler::new)
        .userAgent("MyMineSkinApp/v1.0")
        .apiKey("<TOKEN>")
        .build();
GenerateRequest request = GenerateRequest.upload(file)
        .name("My Skin")
        .visibility(Visibility.PUBLIC);
client.queue().get("<job id>").thenAccept(response -> {
    JobInfo job = response.getJob();
});