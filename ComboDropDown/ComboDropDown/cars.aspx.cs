using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace ComboDropDown
{
    public partial class combo : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            cbddMake.DataSource = carHandler.getArr(carHandler.getCarDataTable(),
                                        "MakeText",
                                        String.Empty);
            cbddMake.DataBind();
        }
    }
}