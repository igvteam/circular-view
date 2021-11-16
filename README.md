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

* hideTrack( id )  -- Hide the specified track

* showTrack( id )  -- Show the specified track

* deleteTrack( id )

* setTrackColor( id, color)  -- Set the color of the specified track

* setTrackAlpha( id, alpha)  -- Set the alpha of the specified track


