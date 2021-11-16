# circular-view

A wrapper class for jBrowse genomic circular view component for use by IGV projects.  This class is tailored for
IGV use cases, for general see the jBrowse project:

* [https://github.com/GMOD/jbrowse-components/tree/main/products/jbrowse-react-circular-genome-view](https://github.com/GMOD/jbrowse-components/tree/main/products/jbrowse-react-circular-genome-view)


## API

### Properties

* tracks  -- Array of track property configuration objects (see below)

```
 [
    {
       id: string,
       name: string, 
       color: string, 
       visible: boolean
    }
 ]
 ```

### Methods

* setAssembly( {name: string, id: string, chromosomes: [{name: string, bpLength: integer, color: string} ) {

* addChords(newChords, options = {})

     * @param newChords -- array of chord feature objects.  Example:
     
     ```
      [
        {
          "uniqueId": "chr1:129763372-129763376_chr1:129806775-129806790",
          "color": "rgba(0, 0, 255, 0.1)",
          "refName": "1",
          "start": 129763372,
          "end": 129763376,
          "mate": {
            "refName": "2",
            "start": 129806775,
            "end": 129806790
          }
        }
      ]
     ```
    
     * @param options 
     
     ```
      {
          id: string       // Unique id -- optional, will be generated if absent
          name: string,    // Track name
          color: string,   // Track color
          alpha: number    // Alpha transparency,  0 <= alpha <= 1
       }
     ```
  
  
* hideTrack( id )  -- Hide the specified track

* showTrack( id )  -- Show the specified track

* deleteTrack( id )

* setTrackColor( id, color)  -- Set the color of the specified track

* setTrackAlpha( id, alpha)  -- Set the alpha of the specified track


