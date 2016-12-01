using System;
using System.Linq;
using System.Web;
using System.Web.UI.WebControls;

namespace ComboDropDown
{
    public class CBLDropDown : CheckBoxList
    {
        // If nothing is selected, show something like "Please select ..."
        public String selectTitle { get; set; }

        //Expand or hide on start
        public Boolean OpenOnStart { get; set; }

        // if False, it's like a <select>, no check boxes will be displayed
        public Boolean Multi { get; set; }

        // If Alltxt != null and there's more than 1 option, make "All ..." the first option
        public String Alltxt { get; set; }

        public String nextID { get; set; } // If a change cascades, the ID of the next CBLDropDown

        public String[] chkd { get; set; } // values that get checked (if exists)

        public String topLevel { get; set; } // the top most control to send with refreshes

        public String NA { get; set; } // Put the div with only this string in it, like "N/A"

        private Boolean AJAX { get; set; } // Does not need the parent div

        public void RenderPublic(System.Web.UI.HtmlTextWriter writer)
        {
            AJAX = true;
            Render(writer);
        }

        /// Display as a dropdown list
        protected override void Render(System.Web.UI.HtmlTextWriter writer)
        {
            //default css class
            if (String.IsNullOrEmpty(CssClass))
                CssClass = "ddlchklst";

            String titleDiv = "<span class=\"" + CssClass + "_span\">{0}</span>";

            //rendering the control:
            if (NA != null)
            {   // MAKE SURE changes are in getNAinnerhtmml()
                writer.Write("<div style='width:" + Unit.Pixel((Convert.ToInt32(this.Width.Value) + 2)) + "'><div id='" + this.ID + "' style='width:" + this.Width + "' class='" + CssClass + "_na'>");
                writer.Write("<spanclass=\"" + CssClass + "_span\">" + NA + "</span></div></div>");
                return;
            }

            if (!AJAX) // containing div not needed if it's a JavaScript update
            {
                if (!OpenOnStart) CssClass += "_hid";
                writer.Write("<div style='width:" + Unit.Pixel((Convert.ToInt32(this.Width.Value) + 2)) + "'><div id='" + this.ID + "' style='width:" + this.Width + "' class='" + CssClass + "'>");
            }
            else if (OpenOnStart) // use script to change 
                writer.Write("<script type=\"text/javascript\">$('#" + this.ID + "').attr('class', 'ddlchklst')</script>");

            //unorder list:
            const String ulTag = "<ul id='{0}'>";
            const String selClass = " class=sel";

            //check box:
            const String chkbox = "<input type=checkbox value=\"{0}\"{1}{2} />";

            //title for check box:
            const String label = "<label>{0}</label>";
            const String liCode = "<li onclick='uD(this, event)'{0}>";
            Boolean allChecked = (chkd != null && chkd.Contains("All"));
            int selectedCount = 0;

            // first process the list so we know counts if wanted
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            if (Alltxt != null && Items.Count > 1)
            {   // Include All option, even in select non-Multi style
                sb.Append(String.Format(liCode, allChecked ? selClass : String.Empty));
                if (Multi)
                    sb.Append(String.Format(chkbox,
                        "All",
                        allChecked ? " checked" : String.Empty,
                        " id='" + this.ID + "_All'"));

                sb.Append(String.Format(label, Alltxt));
                sb.Append("</li>");
            }

            String selected = String.Empty;
            for (int index = 0; index < Items.Count; index++)
            {
                if ((allChecked && Multi)
                    || (chkd != null && chkd.Contains(Items[index].Value))
                    || Items[index].Value == Convert.ToString(this.SelectedValue)
                    || Items.Count == 1)
                {
                    Items[index].Selected = true;
                    sb.Append(String.Format(liCode, selClass));
                }
                else
                    sb.Append(String.Format(liCode, String.Empty));

                if (Items[index].Selected)
                {
                    selectedCount++;
                    sb.Append(String.Format(chkbox,
                        Items[index].Value,
                        " checked",
                        Multi ? String.Empty : " class=hid"));
                }
                else
                    sb.Append(String.Format(chkbox,
                        Items[index].Value,
                        String.Empty,
                        Multi ? String.Empty : " class=hid"));

                //xxs sb.Append(String.Format(label, WebUtility.HtmlEncode(Items[index].Text)));
                sb.Append(String.Format(label, Items[index].Text));

                sb.Append("</li>");
                if (Items[index].Selected) selected += ",\"" + Items[index].Value + "\"";
            }

            String jTitle;
            if (Items.Count == 0)
                jTitle = "";
            else if (selectedCount > 0)
            {
                if (selectedCount == 1)
                    jTitle = Convert.ToString(this.SelectedItem);
                else if (selectedCount == this.Items.Count)
                    jTitle = "All " + selectedCount + " selected";
                else
                    jTitle = selectedCount + " selected";
            }
            else if (Multi)
                jTitle = selectTitle ?? "Select";
            else
                jTitle = Convert.ToString(this.SelectedItem);


            //xxs writer.Write(String.Format(titleDiv, WebUtility.HtmlEncode(jTitle)));
            writer.Write(String.Format(titleDiv, jTitle));


            writer.Write(String.Format(ulTag, this.ID + "_ul"));
            writer.Write(sb.ToString() + "</ul>");

            if (selected.Length > 1) selected = selected.Substring(1);

            string val = "{"; // JSON in hidden field
            if (nextID != null)
                val += "\"nextID\":\"" + nextID + "\",";
            if (topLevel != null)
                val += "\"tl\":\"" + topLevel + "\",";
            val += "\"chkd\":[" + selected + "]}";
            writer.Write("<input type='hidden' value='" +
                //xxs WebUtility.HtmlEncode(val) +
                val.Replace("\"", "&quot;").Replace("\'", "&#39;") +
                "' id='" + this.ID + "_hf' />");

            if (!AJAX)
                writer.Write("</div></div>");
        }

        public static String getNAinnerhtmml(String NA, String divID, String Class)
        {   // Called from AJAX directly
            // set an element's class with _na
            // MAKE SURE changes are in SIMILAR CODE IN Render()!
            return "<span class=\"" + Class + "_span\">" + NA + "</span><script type=\"text/javascript\">$('#" + divID + "').attr('class', '" + Class + "_na')</script>";
        }

        public static String getSelectedCSV(CBLDropDown cbdd)
        {
            String values = String.Empty;
            for (int i = 0; i < cbdd.Items.Count; i++)
                if (cbdd.Items[i].Selected && cbdd.Items[i].Value != "All")
                    values += "," + cbdd.Items[i].Value;

            if (values.Length > 1) values = values.Substring(1);
            return values;
        }

        public static String getSelectedCSVQuotes(CBLDropDown cbdd)
        {
            String values = String.Empty;
            for (int i = 0; i < cbdd.Items.Count; i++)
                if (cbdd.Items[i].Selected && cbdd.Items[i].Value != "All")
                    values += "','" + cbdd.Items[i].Value;

            if (values.Length > 3) values = values.Substring(3);
            return values;
        }
        public class cntrl
        {
            public String ID { get; set; }
            public String[] chkd { get; set; }
        }
    }
}