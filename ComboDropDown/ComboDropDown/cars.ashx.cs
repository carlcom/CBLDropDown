using System;
using System.Collections.Generic;
using System.Data;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using Newtonsoft.Json;

namespace ComboDropDown
{
    /// <summary>
    /// carHandler is the handler class of CBLDropDown that is for the cars pages
    /// </summary>
    public class carHandler : IHttpHandler, IRequiresSessionState
    {
        public void ProcessRequest(HttpContext context)
        {
            String InputString = null;
            using (var sr = new System.IO.StreamReader(context.Request.InputStream))
                InputString = sr.ReadToEnd();
            List<CBLDropDown.cntrl> cntrls = (List<CBLDropDown.cntrl>)JsonConvert.DeserializeObject(InputString, typeof(List<CBLDropDown.cntrl>));
            String Params = context.Request.QueryString["Params"];

            // If there is anything restricted, make sure to check Session for this request
            // Do not trust data in "context", it is easy for the client to manipulate 
            var session = System.Web.HttpContext.Current.Session;


        }


        private Dictionary<String, String> Post(List<CBLDropDown.cntrl> cntrls, String Params)
        {  // script request to update drop down(s)
            // All cntrls need to be sent if needed for filtering

            Dictionary<String, String> dictionary = new Dictionary<String, String>();
            String[] aParams = Params.Split(':');
            
            DataTable CarData = getCarDataTable(); // use cntrls to filter CarData and populate cascading cntrls

            // you could use other elements (radio button etc) passed in Params for other filtering

            String filter = ""; // "table_column='" + aParams[2] + "'";

            Int32 index = 0; // cntrls.Count

            // Any controls starting with aParams[0] will get rebuilt
            if (aParams[0] == "cbddMake")
            {   // start from top
                using (CBLDropDown cbddMake = new CBLDropDown())
                {
                    cbddMake.DataSource = getArr(CarData,
                                                    "MakeText",
                                                    filter);
                    cbddMake.DataBind();
                    cbddMake.chkd = cntrls[index].chkd;
                    if ((cbddMake.chkd == null || cbddMake.chkd.Length == 0) && cbddMake.Items.Count > 0)
                        cbddMake.SelectedIndex = 0; //select the first if nothing is
                    cbddMake.ID = "cbddMake";
                    cbddMake.Multi = true;
                    cbddMake.selectTitle = "Select Make";
                    cbddMake.nextID = "cbddModel";
                    if (aParams[1] == "cbddMake") // user is waiting for control to open
                        cbddMake.OpenOnStart = true;
                    using (System.IO.StringWriter stringWriter = new System.IO.StringWriter())
                    using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter))
                    {
                        cbddMake.RenderPublic(writer);
                        dictionary.Add("cbddMake", stringWriter.ToString());
                    }
                    filter += " AND MakeText IN ('" + CBLDropDown.getSelectedCSVQuotes(cbddMake) + "')";
                }
            }
            else
                filter += " AND MakeText IN ('" + String.Join("','", cntrls[index].chkd) + "')";

            index++; // now cbddModel 

             // If (no model) and sending cbddModel, set to NA
             //   dictionary.Add("cbddModel", CBLDropDown.getNAinnerhtmml("N/A", "cbddModel", "ddlchklst"));

       //     if ((aParams[0] == "cbddModel" || dictionary.Count > 0) && cntrls.Count > index)
                using (CBLDropDown cbddModel = new CBLDropDown())
                {
                    cbddModel.topLevel = "cbddRegion";
                    cbddModel.DataSource = getArr(CarData,
                                                    "Curr_Assigned_Site_Name",
                                                    filter);
                    cbddModel.DataBind();
                    cbddModel.selectTitle = "Select Model";
                    if (cntrls[index].ID == "cbddModel")
                        cbddModel.chkd = cntrls[index].chkd;
                    if ((cbddModel.chkd == null || cbddModel.chkd.Length == 0) && cbddModel.Items.Count > 0)
                        cbddModel.SelectedIndex = 0; //select the first if nothing is
                    cbddModel.ID = "cbddModel";
                    cbddModel.Multi = true;
                    cbddModel.nextID = "cbddOptions";
                    if (aParams[1] == "cbddModel") // user is waiting for control to open
                        cbddModel.OpenOnStart = true;
                    using (System.IO.StringWriter stringWriter = new System.IO.StringWriter())
                    using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter))
                    {
                        cbddModel.RenderPublic(writer);
                        dictionary.Add("cbddModel", stringWriter.ToString());
                    }
                    filter += " AND ModelText IN ('" + CBLDropDown.getSelectedCSVQuotes(cbddModel) + "')";
                }
            //  else if (index < cntrls.Count && cntrls[index].ID == "cbddModel")
            //      filter += " AND ModelText IN ('" + String.Join("','", cntrls[index].chkd) + "')";


            if (cntrls[cntrls.Count - 1].ID == "cbddOptions") // disabled control not sent
                using (CBLDropDown cbddOptions = new CBLDropDown())
                {
                    index = cntrls.Count - 1;
                    cbddOptions.Alltxt = "All";
                    cbddOptions.topLevel = "cbddMake";

                    cbddOptions.DataSource = getArr(CarData,
                                                    "OptionsText",
                                                    filter);
                    cbddOptions.DataBind();
                    cbddOptions.selectTitle = "Select Options";
                    cbddOptions.chkd = cntrls[index].chkd;
                    cbddOptions.ID = "cbddOptions";
                    cbddOptions.Multi = true;
                    if (aParams[1] == "cbddOptions") // user is waiting for control to open
                        cbddOptions.OpenOnStart = true;

                    using (System.IO.StringWriter stringWriter = new System.IO.StringWriter())
                    using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter))
                    {
                        cbddOptions.RenderPublic(writer);
                        dictionary.Add("cbddOptions", stringWriter.ToString());
                    }
                }

            return dictionary;
        }

        public static string getCSV(DataTable dt, string column, string filter)
        {
            return string.Join(",", getArr(dt, column, filter));
        }

        public static string[] getArr(DataTable dt, string column, string filter)
        { // return sorted filtered distinct column from dt
            DataView view = new DataView(dt);

            // set the row filtering on the view...
            view.RowFilter = filter;
            view.Sort = column;

            DataTable distinctTable = view.ToTable(true, new string[] { column });
            var nullRows = distinctTable.Select(column + " IS NULL");
            foreach (var row in nullRows) row.Delete();

            string[] ar = new string[distinctTable.Rows.Count];
            for (int i = 0; i < distinctTable.Rows.Count; i++)
                if (distinctTable.Rows[i][0].ToString() != "")
                    ar[i] = distinctTable.Rows[i][0].ToString();

            return ar;
        }

        public static DataTable getCarDataTable()
        {
            if (System.Web.HttpContext.Current.Application["CarData"] != null)
                return (DataTable)System.Web.HttpContext.Current.Application["CarData"];

            DataTable CarData = new DataTable("CarData");
            // One flat DataTable: Consider other structures especially if your data is big!
            CarData.Columns.Add(new DataColumn("MakeText", typeof(String)));
            CarData.Columns.Add(new DataColumn("ModelText", typeof(String)));
            CarData.Columns.Add(new DataColumn("OptionText", typeof(String)));

            // Need some data for ComboDropDown, not a good example for data consistency or maintainability!
            CarData.Rows.Add(new Object[] { "Ford", "Model T", null });
            CarData.Rows.Add(new Object[] { "Ford", "Focus RS", "Roll Cage" });
            CarData.Rows.Add(new Object[] { "Ford", "Focus RS", "Bigger Turbo" });
            CarData.Rows.Add(new Object[] { "Ford", "Focus RS", "Bigger Tires" });

            CarData.Rows.Add(new Object[] { "Ford", "GT", "Recarro Leather" });
            CarData.Rows.Add(new Object[] { "Ford", "GT", "Navigation" });

            CarData.Rows.Add(new Object[] { "Nissan", "GTR", "Roll Cage" });
            CarData.Rows.Add(new Object[] { "Nissan", "GTR", "Bigger Turbo" });
            CarData.Rows.Add(new Object[] { "Nissan", "GTR", "Bigger Tires" });
            CarData.Rows.Add(new Object[] { "Nissan", "GTR", "Recarro Leather" });
            CarData.Rows.Add(new Object[] { "Nissan", "GTR", "Navigation" });

            CarData.Rows.Add(new Object[] { "Nissan", "Leaf", "Solar Panel Roof" });
            CarData.Rows.Add(new Object[] { "Nissan", "Leaf", "Solar Panel Hood" });

            CarData.Rows.Add(new Object[] { "VW", "Jetta", "Bigger Tires" });
            CarData.Rows.Add(new Object[] { "VW", "Jetta", "8 Speaker Stereo"});
            CarData.Rows.Add(new Object[] { "VW", "Jetta", "12 Speaker Stereo" });
            CarData.Rows.Add(new Object[] { "VW", "Jetta", "20 Speaker Stereo" });
            CarData.Rows.Add(new Object[] { "VW", "Jetta", "Wood Steering Wheel" });

            CarData.Rows.Add(new Object[] { "VW", "Golf", "Recarro Leather" });
            CarData.Rows.Add(new Object[] { "VW", "Golf", "Navigation" });
            CarData.Rows.Add(new Object[] { "VW", "Golf",  "Car Phone"});

            CarData.Rows.Add(new Object[] { "Custom", "Golf cart", null });

            // Typically from a database, if data is the same for all users consider storing in Application variable
            System.Web.HttpContext.Current.Application["CarData"] = CarData;
            return CarData;
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}