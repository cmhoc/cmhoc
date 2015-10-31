$("#vote").validator({
    custom: {
        column: function($el) {
            var same_column = $("input:radio[data-column=" + $el.val() + "]:checked");
            if (same_column.length > 1) return false;
            return true;
        }
    },
    errors: {
        column: "One vote per column."
    }
});

function columnValid(col) {
    var same_column = $("input:radio[data-column=" + col + "]:checked");
    if (same_column.length > 1 || same_column.length === 0) return false;
    return true;
}

$("#vote").submit(function(e) {
    e.preventDefault();
    var valid = true;
    
    for(var i = 0; i < $("#candidates").find("tr:first td").length - 1; i++) {
        if(!columnValid(i + 1)) {
            valid = false;
        }
    }
    
    if(valid) {
        $.post('/vote/' + #{election.id}, $('#vote').serialize())
            .done(function(response) {
                bootbox.alert(response.message, function() {
                    window.location.href = 'https://reddit.com/r/cmhoc';
                });
            })
            .fail(function(response) {
                bootbox.alert(response.error);
            });
    } else {
        bootbox.alert("Only one vote per candidate and one vote per column please.");
    }
});