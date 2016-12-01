<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="cars.aspx.cs" Inherits="ComboDropDown.combo" %>
<%@ Register Namespace="ComboDropDown" Assembly="ComboDropDown" TagPrefix="cdd" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Combo Drop Down</title>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js">// no specific version </script>
    <script type="text/javascript" src="inc/combo.js"></script>
    <link rel="stylesheet" type="text/css" href="inc/combo.css" />
</head>
<body>

    <div>
    Uses small, simple javascript and JSON to populate cascading multi select drop downs.
    </div>
    <!-- Yes I still like tables for layout! -->
    <table><tr><td colspan=3>Fake car data</td></tr>
        <tr><td><cdd:CBLDropDown id="cbddMake" runat="server" selectTitle="Select Make" nextID="cbddModel" ClientIDMode="Static" Multi="true" Width="100px" /></td>
            <td><cdd:CBLDropDown id="cbddModel" runat="server" nextID="cbddOptions" ClientIDMode="Static" Multi="true" Width="100px" /></td>
            <td><cdd:CBLDropDown id="cbddOptions" runat="server" ClientIDMode="Static" Multi="true" Width="100px" /></td>
        </tr>
    </table>
<script type="text/javascript"><%// Script in combo.js is shared, so getURL is on each page like this %>
    function getURL(n) {

        if (n != null) // populate drop downs
            return "cars.ashx?Params=" + n;

        // get "report"
        return "cars.ashx?Rpt=noRptOption";
    }
</script>
</body>
</html>
