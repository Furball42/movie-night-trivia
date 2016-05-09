using HtmlAgilityPack;
using Movie_Night_Trivia.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;

namespace Movie_Night_Trivia.Controllers
{
    public class TrivaDataController : ApiController
    {
        public Movie[] Get()
        {
            Random r = new Random();
            Movie[] lstMovies = new Movie[250]; //total list of movies
            Movie[] lstUserPackage = new Movie[8]; //8 selected per user randomly
            string[] lstPosters = new string[250];
            WebClient client;
            HtmlDocument doc;
            int iCounter = 0; //iterate through rows to add to array

            //locate url
            Uri uri = new Uri("http://www.imdb.com/chart/top?ref_=nb_mv_3_chttp");
            client = new WebClient();
            client.Headers[HttpRequestHeader.AcceptLanguage] = "en-US";

            //download html content
            var data = client.DownloadData(uri);
            var html = Encoding.UTF8.GetString(data);            

            //load content in to html doc for scraping
            doc = new HtmlDocument();
            doc.LoadHtml(html);

            var nodes = doc.DocumentNode.Descendants().Where(n => n.Attributes.Any(a => a.Value.Contains("lister-list")));
            var movieRows = doc.DocumentNode.Descendants("td").Where(d => d.Attributes.Contains("class") && d.Attributes["class"].Value.Contains("titleColumn"));
            var posterRows = doc.DocumentNode.Descendants("td").Where(d => d.Attributes.Contains("class") && d.Attributes["class"].Value.Contains("posterColumn"));

            foreach (var row in movieRows)
            {
                //deconstruct each <tr> containing move info
                int iRank = FormatMovieRankForID(row.InnerHtml);
                string sTitle = HttpUtility.HtmlDecode(row.Descendants("a").First().InnerText);
                string sYear = row.Descendants("span").Where(d => d.Attributes.Contains("class") && d.Attributes["class"].Value.Contains("secondaryInfo")).First().InnerText;
                sYear = sYear.Replace("(", "").Replace(")", "");

                //create movie object and add to array
                Movie m = new Movie();
                m.Id = iRank;
                m.Title = sTitle;
                m.Year = sYear;

                lstMovies[iCounter] = m;
                iCounter++;
            }

            //load posters into array to add to movie array if needed
            HtmlNodeCollection nd = doc.DocumentNode.SelectNodes("//img");
            string sURL = String.Empty;
            for (int x = 0; x <= 249; x++)
            {
                sURL = nd[x + 3].Attributes["src"].Value;
                lstPosters[x] = sURL;
            }

            //determine random 8 movies for user
            for (int i = 0; i < 8; i++)
            {
                int iRandomIndex = r.Next(lstMovies.Count());
                lstMovies[iRandomIndex].ImageURL = lstPosters[iRandomIndex];
                lstUserPackage[i] = lstMovies[iRandomIndex];

                //add check for duplicates -> or remove from array
            }


            return lstUserPackage;
        }

        //helpers
        private int FormatMovieRankForID(string sRow)
        {
            string sRank = sRow.Substring(0, sRow.IndexOf("."));
            return Int32.Parse(sRank);
        }
    }
}
