﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using DisplayMonkey.Models;

namespace DisplayMonkey.Controllers
{
    public class SettingController : Controller
    {
        private DisplayMonkeyEntities db = new DisplayMonkeyEntities();

        // GET: /Setting/
        public ActionResult Index()
        {
            Navigation.SaveCurrent();

            return View(db.Settings.ToList());
        }

        // GET: /Setting/Edit/5
        public ActionResult Edit(Guid? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Setting setting = db.Settings.Find(id);
            if (setting == null)
            {
                return HttpNotFound();
            }
            return View(setting);
        }

        // POST: /Setting/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include="Key,IntValue")] Setting setting)
        {
            if (ModelState.IsValid)
            {
                db.Settings.Attach(setting);
                db.Entry(setting).Property(p => p.Value).IsModified = true;
                db.SaveChanges();

                return Navigation.Restore() ?? RedirectToAction("Index");
            }
            return View(setting);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
