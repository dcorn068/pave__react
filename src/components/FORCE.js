import * as d3 from 'd3';
import ReactDOM from 'react-dom';

const FORCE = function(nsp) {
  let paused;
  const width = window.innerWidth,
    height = window.innerHeight,
    // optional: constrain nodes within a bounding box
    nodeTransform = d => {
      // const minLength = Math.min(width, height) * 0.75;
      // const constrainedX = Math.min(Math.max(d.x, -minLength), minLength);
      // const constrainedY = Math.min(Math.max(d.y, -minLength), minLength);
      // return 'translate(' + constrainedX + ',' + constrainedY + ')';
      return 'translate(' + d.x + ',' + d.y + ')';
    },
    // force parameters
    clusterPadding = 30,
    centerGravity = 0.75,
    collideStrength = 0.5,
    friction = 0.7,
    startSpeed = 0.6,
    restartSpeed = 0.3,
    speedDecay = 0.01,
    endSpeed = 0,
    // color scale
    color = d3.scaleOrdinal(d3.schemeCategory10),
    // cluster force implementation
    cluster = (nodes, radiusScale, radiusSelector, clusterCenters) => {
      // default strength if unspecified
      let strength = 0.1;

      function forceCluster(alpha) {
        // scale + curve alpha value
        alpha *= strength * alpha;

        nodes.forEach(d => {
          let cluster = clusterCenters[d.cluster];
          if (cluster === d) return;

          let x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = 1 * Math.sqrt(x * x + y * y),
            r =
              radiusScale(d[radiusSelector]) +
              radiusScale(cluster[radiusSelector]);

          if (l !== r) {
            l = ((l - r) / l) * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
          }
        });
      }

      forceCluster.initialize = function(_) {
        nodes = _;
      };

      forceCluster.strength = _ => {
        strength = _ == null ? strength : _;
        return forceCluster;
      };

      return forceCluster;
    },
    initForce = ({ nodes, radiusScale, radiusSelector, clusterCenters }) => {
      console.log({ clusterCenters });

      // initialize node positions in a circle sorted by cluster to separate clusters
      // let nodesInitialPositions = nodes.map(d => {
      //   d.x =
      //     Math.cos((d.cluster / clusterCenters.length) * 2 * Math.PI) * 200 +
      //     Math.random();
      //   d.y =
      //     Math.cos((d.cluster / clusterCenters.length) * 2 * Math.PI) * 200 +
      //     Math.random();
      //   return d;
      // });

      nsp.force = d3
        // .forceSimulation(nodesInitialPositions)
        .forceSimulation(nodes)
        // collision force prevents node overlap
        // .force(
        //   'collide',
        //   d3
        //     .forceCollide(d => radiusScale(d[radiusSelector]))
        //     .strength(collideStrength)
        // )
        // charge/repellent force helps nodes equilibrate into clusters by reducing friction
        .force(
          'charge',
          d3.forceManyBody().strength(d => {
            return (
              -Math.pow(radiusScale(d[radiusSelector]), 2) - clusterPadding
            ); // todo: calculate this magic number
          })
        )
        // optional center force re-centers the viewport around the nodes
        // .force('center', d3.forceCenter([width / 2, height / 2]))
        // forces that push nodes to the center
        .force('x', d3.forceX().strength(centerGravity))
        .force('y', d3.forceY().strength(centerGravity))
        // cluster force attracts nodes to their cluster center nodes
        .force(
          'cluster',
          cluster(nodes, radiusScale, radiusSelector, clusterCenters).strength(
            1
          )
        )
        .velocityDecay(friction)
        .alpha(startSpeed)
        .alphaDecay(speedDecay)
        .alphaTarget(endSpeed);
    },
    stopSimulation = () => {
      nsp.force.stop();
      paused = true;
      nsp.paused = true;
    },
    restartSimulation = () => {
      paused = false;
      nsp.paused = false;
      nsp.force
        .velocityDecay(friction)
        .alpha(restartSpeed)
        .alphaDecay(speedDecay)
        .alphaTarget(endSpeed)
        .restart();
    },
    enterNode = (selection, radiusScale, radiusSelector) => {
      // circles
      selection
        .select('circle')
        .attr('r', d => radiusScale(d[radiusSelector]))
        // .attr('r', d => 10)
        .style('fill', d => color(d.cluster))
        .style('stroke', '#272727')
        .style('stroke-width', 0)
        .attr('transform', d => nodeTransform(d));

      // text labels
      selection
        .select('text')
        .attr('id', d => `text_${d.id}`)
        .style('fill', 'honeydew')
        .style('font-weight', '600')
        .style('text-transform', 'uppercase')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('font-size', '10px')
        .style('font-family', 'cursive')
        .style('display', 'none');
    },
    updateNode = selection => {
      selection
        .attr('transform', d => nodeTransform(d))
        // is this necessary?
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    },
    updateGraph = selection => {
      selection.selectAll('.node').call(updateNode);
    },
    dragStarted = d => {
      if (!d3.event.active) nsp.force.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },
    dragging = d => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    },
    dragEnded = d => {
      if (!d3.event.active) nsp.force.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    },
    drag = () =>
      d3.selectAll('g.node').call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragging)
          .on('end', dragEnded)
      ),
    removeDrag = () =>
      d3.selectAll('g.node').call(
        d3
          .drag()
          .on('start', null)
          .on('drag', null)
          .on('end', null)
      ),
    tick = that => {
      that.d3Graph = d3.select(ReactDOM.findDOMNode(that));
      nsp.force.on('tick', () => {
        that.d3Graph.call(updateGraph);
      });
    };

  nsp.width = window.innerWidth;
  nsp.height = window.innerHeight;
  nsp.nodeTransform = nodeTransform;
  nsp.enterNode = enterNode;
  nsp.updateNode = updateNode;
  nsp.updateGraph = updateGraph;
  nsp.cluster = cluster;
  nsp.initForce = initForce;
  nsp.stopSimulation = stopSimulation;
  nsp.restartSimulation = restartSimulation;
  nsp.dragStarted = dragStarted;
  nsp.dragging = dragging;
  nsp.dragEnded = dragEnded;
  nsp.drag = drag;
  nsp.removeDrag = removeDrag;
  nsp.tick = tick;
  nsp.paused = paused;

  return nsp;
};
FORCE(FORCE || {});

export default FORCE;
