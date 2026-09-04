namespace Books.Api.Dtos;

public record QuoteInput(string? Text, string? Author);
public record QuoteView(int Id, string Text, string Author);
