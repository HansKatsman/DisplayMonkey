﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DisplayMonkey.Controllers
{
    public class ErrorController : Controller
    {
        public ActionResult Index()
        {
            return View("Error");
        }

        public ActionResult NotFound()
        {
            return View();
        }
    }

    public class MissingItem
    {
        public MissingItem(int id)
        {
            this.id = id;
            this.resource = HttpContext.Current.Request.RequestContext.RouteData.GetRequiredString("controller");
        }
        public MissingItem(int id, string resource)
        {
            this.id = id;
            this.resource = resource;
        }
        public int id { get; set; }
        public string resource { get; set; }
    }
}