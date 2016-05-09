using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Movie_Night_Trivia.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Year { get; set; }
        public bool isCorrect { get; set; }
        public string Answer { get; set; }
        public string ImageURL { get; set; }
    }

    public class MovieDB : DbContext
    {
        public DbSet<Movie> Movies { get; set; }
    }
}