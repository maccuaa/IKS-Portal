$(document).ready(function() {

    var selected_tab = "#Tab-Clients";
    var selected_client_row;
    var selected_ticket_row;
    var selected_user_row;

    var editing = false;

    RefreshClientTable ();
    RefreshTicketTable ();
    RefreshUserTable ();

    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        selected_tab = $(this).attr ('href');
    });

    $("#Tab-Clients #Success").hide ();
    $("#Tab-Clients #Errors").hide ();
    $("#Tab-Tickets #Success").hide ();
    $("#Tab-Tickets #Errors").hide ();
    $("#Tab-Users #Success").hide ();
    $("#Tab-Users #Errors").hide ();
    $("#Form-Client #Errors").hide ();
    $("#Form-Ticket #Errors").hide ();
    $("#Form-User #Errors").hide ();

    //- ==============================
    //- Client Modal
    //- ==============================

    // Set up the modal
    $("#Client-Modal")
        .modal ({
           show: false
        })
        .on('hidden.bs.modal', function (e) {
            ClearModal ();
        });


    //- ==============================
    //- Ticket Modal
    //- ==============================

    // Set up the modal
    $("#Ticket-Modal")
        .modal ({
            show: false
        })
        .on('hidden.bs.modal', function (e) {
            ClearModal ();
        });


    // Set up the datepicker
    $("#Ticket-Modal #date_created").datepicker ({
        format: 'dd M yyyy',
        autoclose: true,
        todayHighlight: true
    });

    $("#Ticket-Modal #service").select2 ({
        minimumResultsForSearch : -1
    });
    $("#Ticket-Modal #status").select2 ({
        minimumResultsForSearch : -1
    });

    //- ==============================
    //- User Modal
    //- ==============================

    // Set up the modal
    $("#User-Modal")
        .modal ({
           show: false
        })
        .on('hidden.bs.modal', function (e) {
            ClearModal ();
        });

    //- ==============================
    //- Helper Button Handlers
    //- ==============================

    // Close alert dialogs
    $(".alert button").click (function (e) {
        $(this).parent ().hide ();
    });

    //- ==============================
    //- Client Button Handlers
    //- ==============================

    // Create
    $("#Btn-Create-Client").click (function (e) {
        $("#Client-Modal").modal ("show");
        editing = false;
        e.preventDefault();
    });

    // Edit
    $("#Btn-Edit-Client").click (function (e) {
        $("#Client-Modal").modal ("show");
        PopulateModal ();
        editing = true;
        e.preventDefault();
    });

    // Refresh
    $("#Btn-Refresh-Client").click (function (e) {
        RefreshClientTable ();
        e.preventDefault ();
    });

    // Search
    $("#Search-Client").keyup (function (e) {
        SearchTable ($(this), "#Client-Table");
    });

    // Delete
    $("#Btn-Delete-Client").click (function (e) {
        $(this)
            .confirmation ('destroy')
            .confirmation ({
                popout : true,
                btnOkClass : 'btn-sm btn-danger',
                btnOkIcon : 'fa fa-check',
                btnCancelClass : 'btn-sm btn-default',
                btnCancelIcon : 'fa fa-times',
                title : "Delete " + selected_client_row.name + "?",
                placement : 'right',
                onConfirm : function () {
                    $.post ('/dashboard/delete_client', selected_client_row, function (data) {
                        if (data.error) {
                            ShowErrorMessage (data.error);
                        }
                        else {
                            if (data.success)
                                ShowSuccessMessage (selected_client_row.name + ' deleted successfully');
                            RefreshClientTable ();
                            PopulateDropdowns ();
                        }
                    });
                }
        })
        .confirmation ('show');
    });

    // Modal form submit handler
    $("#Form-Client").submit (function (e) {
        var url = "/dashboard";
        if (editing) {
            url += "/edit_client";
        }
        else {
            url += "/create_client";
        }

        $.post (url, $("#Form-Client").serialize (), function (data) {
            if (data.error) {
                $("#Form-Client #Errors").html ("").show ();
                $.each (data.error, function (i, msg) {
                    $("#Form-Client #Errors").append(msg).append("<br />");
                });
            }
            else {
                if (data.success)
                    ShowSuccessMessage (data.success);
                $("#Client-Modal").modal ("hide");
                RefreshClientTable ();
                RefreshTicketTable ();
                PopulateDropdowns ();
            }
        });
        e.preventDefault ();
    });

    //- ==============================
    //- Ticket Button Handlers
    //- ==============================

    // Create Ticket button handler
    $("#Btn-Create-Ticket").click (function (e) {
        $("#Ticket-Modal").modal ("show");
        editing = false;
        e.preventDefault();
    });

    // Edit
    $("#Btn-View-Ticket").click (function (e) {
        $("#Ticket-Modal").modal ("show");
        editing = true;
        PopulateModal ();
        e.preventDefault();
    });

    // Refresh
    $("#Btn-Refresh-Ticket").click (function (e) {
        RefreshTicketTable ();
        e.preventDefault ();
    });

    // Search
    $("#Search-Ticket").keyup (function (e) {
        SearchTable ($(this), "#Ticket-Table");
    });

    // Modal form submit handler
    $("#Form-Ticket").submit (function (e) {
        var url = "/dashboard";
        if (editing) {
            url += "/edit_ticket";
        }
        else {
            url += "/create_ticket";
        }

        $.post (url, $("#Form-Ticket").serialize (), function (data) {
            if (data.error) {
                $("#Form-Ticket #Errors").html ("").show ();
                $.each (data.error, function (i, msg) {
                    $("#Form-Ticket #Errors").append(msg).append("<br />");
                });
            }
            else {
                if (data.success)
                    ShowSuccessMessage (data.success);
                $("#Ticket-Modal").modal ("hide");
                RefreshTicketTable ();
            }
        });
        e.preventDefault ();
    });

    // Delete
    $("#Btn-Delete-Ticket").click (function (e) {
        $(this)
            .confirmation ('destroy')
            .confirmation ({
                popout : true,
                btnOkClass : 'btn-sm btn-danger',
                btnOkIcon : 'fa fa-check',
                btnCancelClass : 'btn-sm btn-default',
                btnCancelIcon : 'fa fa-times',
                title : "Delete " + selected_ticket_row.date_created + ' - ' + selected_ticket_row.client + "?",
                placement : 'right',
                onConfirm : function () {
                    $.post ('/dashboard/delete_ticket', selected_ticket_row, function (data) {
                        if (data.error) {
                            ShowErrorMessage (data.error);
                        }
                        else {
                            ShowSuccessMessage (selected_ticket_row.date_created + ' - ' + selected_ticket_row.client + ' deleted successfully');
                            RefreshTicketTable ();
                        }
                    });
                }
        })
        .confirmation ('show');
    });

    //- ==============================
    //- User Button Handlers
    //- ==============================

    // Edit
    $("#Btn-Edit-User").click (function (e) {
        $("#User-Modal").modal ("show");
        editing = true;
        PopulateModal ();
        e.preventDefault();
    });

    // Refresh
    $("#Btn-Refresh-User").click (function (e) {
        RefreshUserTable ();
        e.preventDefault ();
    });

    // Search
    $("#Search-User").keyup (function (e) {
        SearchTable ($(this), "#User-Table");
    });

    // Modal form submit handler
    $("#Form-User").submit (function (e) {
        var url = "/dashboard/edit_user";

        $.post (url, $("#Form-User").serialize (), function (data) {
            if (data.error) {
                $("#Form-User #Errors").html ("").show ();
                $.each (data.error, function (i, msg) {
                    $("#Form-User #Errors").append(msg).append("<br />");
                });
            }
            else {
                if (data.success)
                    ShowSuccessMessage (data.success);
                $("#User-Modal").modal ("hide");
                RefreshUserTable ();
                RefreshTicketTable ();
                PopulateDropdowns ();
            }
        });
        e.preventDefault ();
    });

    // Delete
    $("#Btn-Delete-User").click (function (e) {
        $(this)
            .confirmation ('destroy')
            .confirmation ({
                popout : true,
                btnOkClass : 'btn-sm btn-danger',
                btnOkIcon : 'fa fa-check',
                btnCancelClass : 'btn-sm btn-default',
                btnCancelIcon : 'fa fa-times',
                title : "Delete " + selected_user_row.name + "?",
                placement : 'right',
                onConfirm : function () {
                    $.post ('/dashboard/delete_user', selected_user_row, function (data) {
                        if (data.error) {
                            ShowErrorMessage (data.error);
                        }
                        else {
                            ShowSuccessMessage (selected_user_row.name + ' deleted successfully');
                            RefreshUserTable ();
                            RefreshTicketTable ();
                        }
                    });
                }
        })
        .confirmation ('show');
    });

    //- ==============================
    //- Helper Functions
    //- ==============================

    // Refresh Client table
    function RefreshClientTable () {
        $("#Client-Table tbody tr").remove ();
        $("#Client-Table tbody").load ("dashboard/load_clients", function () {
            $("#Client-Table tbody tr").click (function (e) {
                OnRowSelected (this, "#Client-Table");
            });

            OnRowSelected ($("#Client-Table tbody tr:first"), "#Client-Table");
        });
    }

    function RefreshTicketTable () {
        $("#Ticket-Table tbody tr").remove ();
        $("#Ticket-Table tbody").load ("dashboard/load_tickets", function () {
            $("#Ticket-Table tbody tr").click (function (e) {
                OnRowSelected (this, "#Ticket-Table");
            });

            PopulateDropdowns ();

            OnRowSelected ($("#Ticket-Table tbody tr:first"), "#Ticket-Table");
        });
    }

    function RefreshUserTable () {
        $("#User-Table tbody tr").remove ();

        $("#User-Table tbody").load ("dashboard/load_users", function () {
            $("#User-Table tbody tr").click (function (e) {
                OnRowSelected (this, "#User-Table");
            });

            OnRowSelected ($("#User-Table tbody tr:first"), "#User-Table");
        });
    }

    function OnRowSelected (row, table) {
        // on click find any rows that have the bg-info class and remove it
        $(table).find (".bg-info").removeClass ("bg-info");

        // add bg-info class to selected row
        $(row).addClass ("bg-info");

        if (table === "#Client-Table") {
            selected_client_row = {
                name    : $(row).children (".name").html (),
                email   : $(row).children (".email").html (),
                phone   : $(row).children (".phone").html (),
                city    : $(row).children (".city").html (),
                address : $(row).children (".address").html (),
                id      : $(row).children (".id").html ()
            };
        }
        else if (table === "#Ticket-Table") {
            selected_ticket_row = {
                date_created : $(row).children (".date").html (),
                client       : $(row).children (".client").html (),
                service      : $(row).children (".service").html (),
                technician   : $(row).children (".technician").html (),
                status       : $(row).children (".status").html (),
                id           : $(row).children (".id").html (),
                description  : $(row).children (".description").html (),
                invoice      : $(row).children (".invoice").html ()
            };
        }
        else if (table === "#User-Table") {
            selected_user_row = {
                name  : $(row).children (".name").html (),
                email : $(row).children (".email").html (),
                id    : $(row).children (".id").html ()
            };
        }
    }

    function ClearModal () {
        if (selected_tab === "#Tab-Clients") {
            $("#Client-Modal #name").val ("");
            $("#Client-Modal #email").val ("");
            $("#Client-Modal #phone").val ("");
            $("#Client-Modal #city").val ("");
            $("#Client-Modal #address").val ("");
            $("#Client-Modal #id").val ("");
            $("#Client-Modal #Errors").html ("");
            $("#Client-Modal #Errors").hide ();
        }
        else if (selected_tab === "#Tab-Tickets") {
            $("#Ticket-Modal #client").select2 ("val", "");
            $("#Ticket-Modal #date_created").val ("");
            $("#Ticket-Modal #technician").select2 ("val", "");
            $("#Ticket-Modal #invoice").val ("");
            $("#Ticket-Modal #description").val ("");
            $("#Ticket-Modal #id").val ("");
            $("#Ticket-Modal #Errors").html ("");
            $("#Ticket-Modal #Errors").hide ();
        }
        else if (selected_tab === "#Tab-Users") {
            $("#User-Modal #name").val ("");
            $("#User-Modal #email").val ("");
            $("#User-Modal #id").val ("");
        }
    }

    function PopulateModal () {
        if (selected_tab === "#Tab-Clients") {
            $("#Client-Modal #name").val (selected_client_row.name);
            $("#Client-Modal #email").val (selected_client_row.email);
            $("#Client-Modal #phone").val (selected_client_row.phone);
            $("#Client-Modal #city").val (selected_client_row.city);
            $("#Client-Modal #address").val (selected_client_row.address);
            $("#Client-Modal #id").val (selected_client_row.id);
            $("#Client-Modal #Errors").html ("");
            $("#Client-Modal #Errors").hide ();
        }
        else if (selected_tab === "#Tab-Tickets") {
            $("#Ticket-Modal #date_created").val (selected_ticket_row.date_created);
            $("#Ticket-Modal #client").select2 ("data", {id : selected_ticket_row.client, text : selected_ticket_row.client });
            $("#Ticket-Modal #service").val (selected_ticket_row.service);
            $("#Ticket-Modal #technician").select2 ("data", {id : selected_ticket_row.technician, text : selected_ticket_row.technician });
            $("#Ticket-Modal #description").val (selected_ticket_row.description);
            $("#Ticket-Modal #status").val (selected_ticket_row.status);
            $("#Ticket-Modal #id").val (selected_ticket_row.id);
            $("#Ticket-Modal #invoice").val (selected_ticket_row.invoice);
            $("#Ticket-Modal #Errors").html (selected_ticket_row.Errors);
            $("#Ticket-Modal #Errors").hide ();
        }
        else if (selected_tab === "#Tab-Users") {
            $("#User-Modal #name").val (selected_user_row.name);
            $("#User-Modal #email").val (selected_user_row.email);
            $("#User-Modal #id").val (selected_user_row.id);
        }
    }

    function PopulateDropdowns () {
        var clients     = [];
        var technicians = [];

        $.get ("dashboard/get_people", function (data) {
            $(data.clients).each (function (i, e) {
                clients.push ({
                    id: i,
                    text: e.name
                });
            });

            $("#Ticket-Modal #client").select2 ({
                data: clients,
                id: function(object) { return object.text; }
            });

            $(data.technicians).each (function (i, e) {
                technicians.push ({
                    id: i,
                    text: e.name
                });
            });

            $("#Ticket-Modal #technician").select2 ({
                data: technicians,
                id: function(object) { return object.text; }
            });
        });
    }

    function ShowSuccessMessage (message, tab) {
        if (selected_tab === "#Tab-Clients") {
            $("#Tab-Clients #Success").show ();
            $("#Tab-Clients #Success .message").html(message);
        }
        else if (selected_tab === "#Tab-Tickets") {
            $("#Tab-Tickets #Success").show ();
            $("#Tab-Tickets #Success .message").html(message);
        }
        else if (selected_tab === "#Tab-Users") {
            $("#Tab-Users #Success").show ();
            $("#Tab-Users #Success .message").html(message);
        }
    }

    function ShowErrorMessage (message, tab) {
        if (selected_tab === "#Tab-Clients") {
            $("#Tab-Clients #Errors").show ();
            $("#Tab-Clients #Errors .message").html(message);
        }
        else if (selected_tab === "#Tab-Tickets") {
            $("#Tab-Tickets #Errors").show ();
            $("#Tab-Tickets #Errors .message").html(message);
        }
        else if (selected_tab === "#Tab-Users") {
            $("#Tab-Users #Errors").show ();
            $("#Tab-Users #Errors .message").html(message);
        }
    }

    function SearchTable (box, table) {
        var search_string = box.val().toLowerCase ();
        var $rows         = $(table + " tbody tr");

        if (search_string.length > 2) {
            $rows.show ().filter (function (index) {
                var $data = $(this).text ().toLowerCase ();
                return $data.search (search_string) === -1;
            }).hide ();
        }
        else
            $rows.show ();
    }

});