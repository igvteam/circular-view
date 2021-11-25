# circular-view

A wrapper class for JBrowse genomic circular view component for use by IGV projects.  This class is tailored for
IGV use cases, for general see the JBrowse project:

* [https://github.com/GMOD/igv-circview-components/tree/main/products/igv-circview-react-circular-genome-view](https://github.com/GMOD/igv-circview-components/tree/main/products/igv-circview-react-circular-genome-view)


## API

### Properties

* tracks  -- Array of track property configuration objects (see below)

```
 [
    {
       id: string,
       name: string, 
       color: string, 
       alpha: number,
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
          id: string,       // Unique id -- optional, will be generated if absent
          name: string,    // Track name
          color: string   // Track color
       }
     ```
  
* clearChords() -- Clear all chords and delete associated tracks
  
* hideTrack( id )  -- Hide the specified track

* showTrack( id )  -- Show the specified track

* deleteTrack( id )

* setTrackColor( id, color)  -- Set the color of the specified track



