(function () {
    'use strict';
	
    var timer = setInterval(function(){
        if(typeof Lampa !== 'undefined'){
            clearInterval(timer);
			
            var unic_id = Lampa.Storage.get('lampac_unic_id', '');
            if (!unic_id) {
              unic_id = Lampa.Utils.uid(8).toLowerCase();
              Lampa.Storage.set('lampac_unic_id', unic_id);
            }
  
            Lampa.Utils.putScriptAsync(["http://lampaua.mooo.com/tracks/js/eam25tis","http://lampaua.mooo.com/tmdbproxy/js/eam25tis","http://lampaua.mooo.com/online/js/eam25tis","http://lampaua.mooo.com/sisi/js/eam25tis","http://lampaua.mooo.com/startpage.js","http://lampaua.mooo.com/sync/js/eam25tis","http://lampaua.mooo.com/backup/js/eam25tis"], function() {});
        }
    },200);
})();