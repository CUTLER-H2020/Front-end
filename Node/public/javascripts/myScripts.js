            $(function ()
            {
                $("#wizard").steps({
                    headerTag: "h2",
                    bodyTag: "section",
                    transitionEffect: "slideLeft"
                });
            });

            function allowDrop(ev) {
              ev.preventDefault();
            };

            function drag(ev) {
              ev.dataTransfer.setData("text", ev.target.id);
            };

            function drop(ev) {
              ev.preventDefault();
              var data = ev.dataTransfer.getData("text");
              ev.target.appendChild(document.getElementById(data));
            };

            function testSubmit()
            {
                var city = document.getElementById("city").value;
                var country = document.getElementById("country").value;
                if (city === "")
                {
                    alert(' fill city!!');
                    return false;
                } 
                if(country === "")
                {
                    alert('fill country!!');
                    return false;
                }
                return true;
            };

            function postRest()
            {
                if (testSubmit())
                {
                    var city=document.getElementById("city").value;
                    var country=document.getElementById("country").value;

                    var xhr = new XMLHttpRequest();
                    var url = "http://127.0.0.1:1923/api/cities";

                    xhr.open("POST", url, true);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var json = JSON.parse(xhr.responseText);
                        }
                    };

                    var datax = JSON.stringify({"name": city , "country": country });
                    xhr.send(datax);

                    document.getElementById("city").value="";
                    document.getElementById("country").value="";
                }
            };

            function addTable(json) {
                var tableBody = document.getElementById('tableOfWidgets');
                var size = json.length;
                var stock = new Array();
                for(i=0; i<size; i++){
                    stock[i] = new Array(json[i].name, json[i].objects.title, json[i].objects.type, json[i].objects.id);
                }

                //TABLE ROWS
                for (i = 0; i < stock.length; i++) {
                    var tr = document.createElement('TR');
                    setId="row"+i;
                    tr.id=setId;
                    for (j = 0; j < stock[i].length+3; j++) {
                        var td = document.createElement('TD')
                        
                        if(j%4==0 && j!=0){
                            var newButton= document.createElement("input");
                            newButton.setAttribute("type", "checkbox");
                            newButton.setAttribute("id", i);
                            td.appendChild(newButton);
                            td.id=setId+j;
                        }
                        else if(j%5==0 && j!=0){
                            var newList = document.createElement("select");
                            var ids = "List"+i;
                            newList.setAttribute("id", ids);
                            
                            var opt1 = document.createElement("option");
                            opt1.appendChild( document.createTextNode('inform') );
                            
                            var opt2 = document.createElement("option");
                            opt2.appendChild( document.createTextNode('analyze') );
                            
                            var opt3 = document.createElement("option");
                            opt3.appendChild( document.createTextNode('monitor') );

                            var opt4 = document.createElement("option");
                            opt4.appendChild( document.createTextNode('evaluate') );

                            var opt5 = document.createElement("option");
                            opt5.appendChild( document.createTextNode('revise') );

                            newList.appendChild(opt1);
                            newList.appendChild(opt2);
                            newList.appendChild(opt3);
                            newList.appendChild(opt4);
                            newList.appendChild(opt5);
                            td.appendChild(newList);
                        }
                        else if(j%6==0 && j!=0){
                            var newList = document.createElement("select");
                            var ids = "Time"+i;
                            newList.setAttribute("id", ids);
                            
                            var opt1 = document.createElement("option");
                            opt1.appendChild( document.createTextNode('5y') );
                            
                            var opt2 = document.createElement("option");
                            opt2.appendChild( document.createTextNode('6M') );
                            
                            var opt3 = document.createElement("option");
                            opt3.appendChild( document.createTextNode('9d') );

                            var opt4 = document.createElement("option");
                            opt4.appendChild( document.createTextNode('24h') );

                            var opt5 = document.createElement("option");
                            opt5.appendChild( document.createTextNode('30m') );

                            newList.appendChild(opt1);
                            newList.appendChild(opt2);
                            newList.appendChild(opt3);
                            newList.appendChild(opt4);
                            newList.appendChild(opt5);
                            td.appendChild(newList);
                        }
                        else if(j%4==0 || j==0){
                            td.appendChild(document.createTextNode(stock[i][j]));
                            td.id=setId+j;
                        }
                        else if(j%4==1 && j!=0){
                            td.appendChild(document.createTextNode(stock[i][j]));
                            td.id=setId+j;
                        }
                        else if(j%4==2 && j!=0){
                            td.appendChild(document.createTextNode(stock[i][j]));
                            td.id=setId+j;
                        }
                        else if(j%4==3 && j!=0){
                            td.appendChild(document.createTextNode(stock[i][j]));
                            td.id=setId+j;
                        }
                        
                        tr.appendChild(td);
                    }
                    tableBody.appendChild(tr);
                }

            };

            function clearLocal(){
              localStorage.clear();
            }

            function sortTable(n) {
              var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
              table = document.getElementById("mytable");
              switching = true;
              // Set the sorting direction to ascending:
              dir = "asc"; 
              /* Make a loop that will continue until
              no switching has been done: */
              while (switching) {
                // Start by saying: no switching is done:
                switching = false;
                rows = table.rows;
                /* Loop through all table rows (except the
                first, which contains table headers): */
                for (i = 1; i < (rows.length - 1); i++) {
                  // Start by saying there should be no switching:
                  shouldSwitch = false;
                  /* Get the two elements you want to compare,
                  one from current row and one from the next: */
                  x = rows[i].getElementsByTagName("TD")[n];
                  y = rows[i + 1].getElementsByTagName("TD")[n];
                  /* Check if the two rows should switch place,
                  based on the direction, asc or desc: */
                  if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                      // If so, mark as a switch and break the loop:
                      shouldSwitch = true;
                      break;
                    }
                  } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                      // If so, mark as a switch and break the loop:
                      shouldSwitch = true;
                      break;
                    }
                  }
                }
                if (shouldSwitch) {
                  /* If a switch has been marked, make the switch
                  and mark that a switch has been done: */
                  rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                  switching = true;
                  // Each time a switch is done, increase this count by 1:
                  switchcount ++; 
                } else {
                  /* If no switching has been done AND the direction is "asc",
                  set the direction to "desc" and run the while loop again. */
                  if (switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                  }
                }
              }
            }

