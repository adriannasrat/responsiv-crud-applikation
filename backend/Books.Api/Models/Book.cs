namespace Books.Api.Models;

public class Book
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public DateOnly PublicationDate { get; set; }
}
