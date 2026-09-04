using System.Security.Claims;
using Books.Api.Data;
using Books.Api.Dtos;
using Books.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Books.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _database;

    public BooksController(AppDbContext database)
    {
        _database = database;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var books = await _database.Books
            .AsNoTracking()
            .Where(book => book.UserId == userId)
            .OrderByDescending(book => book.Id)
            .Select(book => new BookView(
                book.Id,
                book.Title,
                book.Author,
                book.PublicationDate))
            .ToListAsync();

        return Ok(books);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var book = await _database.Books
            .AsNoTracking()
            .SingleOrDefaultAsync(book => book.Id == id && book.UserId == userId);

        if (book is null)
            return NotFound();

        return Ok(new BookView(
            book.Id,
            book.Title,
            book.Author,
            book.PublicationDate));
    }

    [HttpPost]
    public async Task<IActionResult> Create(BookInput input)
    {
        if (!IsValid(input))
            return BadRequest(new { message = "Ange titel, författare och ett giltigt publiceringsdatum." });

        var book = new Book
        {
            UserId = GetUserId(),
            Title = input.Title!.Trim(),
            Author = input.Author!.Trim(),
            PublicationDate = input.PublicationDate!.Value
        };

        _database.Books.Add(book);
        await _database.SaveChangesAsync();

        var result = new BookView(
            book.Id,
            book.Title,
            book.Author,
            book.PublicationDate);

        return CreatedAtAction(nameof(GetById), new { id = book.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BookInput input)
    {
        if (!IsValid(input))
            return BadRequest(new { message = "Ange titel, författare och ett giltigt publiceringsdatum." });

        var userId = GetUserId();
        var book = await _database.Books.SingleOrDefaultAsync(book =>
            book.Id == id && book.UserId == userId);

        if (book is null)
            return NotFound();

        book.Title = input.Title!.Trim();
        book.Author = input.Author!.Trim();
        book.PublicationDate = input.PublicationDate!.Value;

        await _database.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var book = await _database.Books.SingleOrDefaultAsync(book =>
            book.Id == id && book.UserId == userId);

        if (book is null)
            return NotFound();

        _database.Books.Remove(book);
        await _database.SaveChangesAsync();
        return NoContent();
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue("sub")!);
    }

    private static bool IsValid(BookInput input)
    {
        return ValidText(input.Title, 200)
            && ValidText(input.Author, 200)
            && input.PublicationDate is not null;
    }

    private static bool ValidText(string? text, int maximumLength)
    {
        return !string.IsNullOrWhiteSpace(text)
            && text.Trim().Length <= maximumLength;
    }
}
