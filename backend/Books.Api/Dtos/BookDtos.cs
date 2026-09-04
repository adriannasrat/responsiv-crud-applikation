namespace Books.Api.Dtos;

public record BookInput(string? Title, string? Author, DateOnly? PublicationDate);
public record BookView(int Id, string Title, string Author, DateOnly PublicationDate);
