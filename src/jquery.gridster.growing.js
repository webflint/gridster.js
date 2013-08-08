/*
 * jquery.gridster.growing
 * https://github.com/webflint/gridster.js
 *
 */
(function($) {

  var fn = $.Gridster;

  fn.grow = function($widget, dir) {
    var self = this;
    var dirs = dir.split('-');
    var wgd = $widget.coords().grid;
    var newCoords = {
      col: wgd.col + (dirs[1] === 'left' ? -1 : 0),
      row: wgd.row + (dirs[0] === 'top' ? -1 : 0),
      size_x: wgd.size_x + 1,
      size_y: wgd.size_y + 1
    };

    if (newCoords.size_x + newCoords.col - 1 > this.cols) return;
    if (newCoords.size_y + newCoords.row - 1 > this.rows) return;

    var targetColumn = (dirs[1] === 'left' ? 0 : newCoords.size_x) + wgd.col - 1;
    var targetRow = (dirs[0] === 'top' ? 0 : newCoords.size_y) + wgd.row - 1;

    var $targets = this.intersection_at(newCoords, targetColumn, targetRow);

    var findAgain = false;
    $targets.each(function(idx, item) {
      var $w = $(item);
      var grid = $w.data('coords').grid;
      if (grid.size_x > 1 || grid.size_y > 1) {
        self.shrink($w, 1);
        findAgain = true;
      }
    });

    if (findAgain) {
      $targets = this.intersection_at(newCoords, targetColumn, targetRow);
    }

    $targets.not($widget).each($.proxy(function(i, w) {
      var $w = $(w);
      var wgd = $w.coords().grid;
      this.$widgets = this.$widgets.not($w);
      this.remove_from_gridmap(wgd);
      $w.remove();
    }, this));

    this.new_move_widget_to($widget, newCoords.col, newCoords.row);
    this.resize_widget($widget, newCoords.size_x, newCoords.size_y);
    this.$el.trigger('gridster:change');

    return this;
  };


  fn.shrink = function($widget) {
    var wgd = $widget.coords().grid;
    if (wgd.size_x < 2 || wgd.size_y < 2) return;

    var rows = wgd.size_y - 1;
    var cols = wgd.size_x - 1;

    this.resize_widget($widget, 1, 1);

    var $added = $([]);
    while (cols) {
      for (var i = rows; i >= 0; i--) {
        $added.push(this.add_widget($widget.clone(), 1, 1, wgd.col + cols, wgd.row + i));
      }
      --cols;
    }
    while (rows) {
      $added.push(this.add_widget($widget.clone(), 1, 1, wgd.col, wgd.row + rows));
      --rows;
    }
    this.$el.trigger('gridster:change');

    return $added;
  };

  fn.intersection_at = function(grid, col, row) {
    var self = this;
    var span = this.get_widget_span(grid);
    var $result = this.get_widget_at(col).filter(function() {
      var $widget = $(this);
      var spanY = self.get_widget_span($widget.data('coords').grid).rows;
      var intersected = $(spanY).filter(function(idx, item) {
        return span.rows.indexOf(item) !== -1;
      });
      return intersected.length > 0;
    }).add(this.get_widget_at(undefined, row).filter(function() {
      var $widget = $(this);
      var spanX = self.get_widget_span($widget.data('coords').grid).cols;
      var intersected = $(spanX).filter(function(idx, item) {
        return span.cols.indexOf(item) !== -1;
      });
      return intersected.length > 0;
    }));

    return $result;
  };

  fn.get_widget_at = function(col, row) {
    var $widgets = $();
    var self = this;

    $widgets = $widgets.add(
      this.$widgets.filter(function() {
        var span = self.get_widget_span($(this).data('coords').grid);

        return (!col || span.cols.indexOf(col) !== -1) && (!row || span.rows.indexOf(row) !== -1);
      })
    );

    return $widgets;
  };

  fn.get_widget_span = function(grid) {
    var col = parseInt(grid.col, 10);
    var spanX = $.map(new Array(parseInt(grid.size_x, 10)), function(item, idx) {
      return idx + col;
    });

    var row = parseInt(grid.row, 10);
    var spanY = $.map(new Array(parseInt(grid.size_y, 10)), function(item, idx) {
      return idx + row;
    });

    return {cols: spanX, rows: spanY};

  };

})(jQuery);