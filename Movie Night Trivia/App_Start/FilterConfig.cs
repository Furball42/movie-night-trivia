﻿using System.Web;
using System.Web.Mvc;

namespace Movie_Night_Trivia
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}