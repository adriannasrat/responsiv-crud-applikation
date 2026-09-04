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
[Route("api/quotes")]
public class QuotesController : ControllerBase
{
    private readonly AppDbContext _database;

    public QuotesController(AppDbContext database)
    {
        _database = database;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var quotes = await _database.Quotes
            .AsNoTracking()
            .Where(quote => quote.UserId == userId)
            .OrderByDescending(quote => quote.Id)
            .Select(quote => new QuoteView(quote.Id, quote.Text, quote.Author))
            .ToListAsync();

        return Ok(quotes);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var quote = await _database.Quotes
            .AsNoTracking()
            .SingleOrDefaultAsync(quote => quote.Id == id && quote.UserId == userId);

        if (quote is null)
            return NotFound();

        return Ok(new QuoteView(quote.Id, quote.Text, quote.Author));
    }

    [HttpPost]
    public async Task<IActionResult> Create(QuoteInput input)
    {
        if (!IsValid(input))
            return BadRequest(new { message = "Ange ett citat och en upphovsperson." });

        var quote = new Quote
        {
            UserId = GetUserId(),
            Text = input.Text!.Trim(),
            Author = input.Author!.Trim()
        };

        _database.Quotes.Add(quote);
        await _database.SaveChangesAsync();

        var result = new QuoteView(quote.Id, quote.Text, quote.Author);
        return CreatedAtAction(nameof(GetById), new { id = quote.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, QuoteInput input)
    {
        if (!IsValid(input))
            return BadRequest(new { message = "Ange ett citat och en upphovsperson." });

        var userId = GetUserId();
        var quote = await _database.Quotes.SingleOrDefaultAsync(quote =>
            quote.Id == id && quote.UserId == userId);

        if (quote is null)
            return NotFound();

        quote.Text = input.Text!.Trim();
        quote.Author = input.Author!.Trim();

        await _database.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var quote = await _database.Quotes.SingleOrDefaultAsync(quote =>
            quote.Id == id && quote.UserId == userId);

        if (quote is null)
            return NotFound();

        _database.Quotes.Remove(quote);
        await _database.SaveChangesAsync();
        return NoContent();
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue("sub")!);
    }

    private static bool IsValid(QuoteInput input)
    {
        return ValidText(input.Text, 1000)
            && ValidText(input.Author, 200);
    }

    private static bool ValidText(string? text, int maximumLength)
    {
        return !string.IsNullOrWhiteSpace(text)
            && text.Trim().Length <= maximumLength;
    }
}
